using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OpenDrive.Application.Common.Security;
using OpenDrive.Application.Interfaces;
using OpenDrive.Application.Services;
using OpenDrive.Infrastructure.Persistence;
using OpenDrive.Infrastructure.Repositories;
using OpenDrive.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Upload size limits (must be set before .Build()) ─────────────────────────
builder.WebHost.ConfigureKestrel(k =>
{
    k.Limits.MaxRequestBodySize = 104_857_600; // 100 MB
});
builder.Services.Configure<FormOptions>(o =>
{
    o.MultipartBodyLengthLimit = 104_857_600;
    o.ValueLengthLimit = int.MaxValue;
    o.MultipartHeadersLengthLimit = int.MaxValue;
});

// ── Controllers ───────────────────────────────────────────────────────────────
builder.Services.AddControllers();

// ── JWT ───────────────────────────────────────────────────────────────────────
var jwtSection = builder.Configuration.GetSection("JwtSettings");
builder.Services.Configure<JwtSettings>(jwtSection);
var jwt = jwtSection.Get<JwtSettings>()!;
var keyBytes = Encoding.ASCII.GetBytes(jwt.Secret);

builder.Services.AddAuthentication(o =>
{
    o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    o.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(o =>
{
    o.RequireHttpsMetadata = false;
    o.SaveToken = true;
    o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        ValidateIssuer   = true,
        ValidIssuer      = jwt.Issuer,
        ValidateAudience = true,
        ValidAudience    = jwt.Audience,
        ValidateLifetime = true,
        ClockSkew        = TimeSpan.Zero
    };
});

// ── Database ──────────────────────────────────────────────────────────────────
// Resolve the SQLite connection string to an absolute path and make sure the
// containing directory exists. This prevents "SQLite Error 14: unable to open
// database file" whether running locally (Windows/macOS/Linux) or inside Docker.
var rawConnectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=opendrive.db";

string ResolveSqliteConnectionString(string connectionString)
{
    const string prefix = "Data Source=";
    var dbPath = connectionString.Replace(prefix, string.Empty).Trim();

    // If the configured path is rooted (e.g. "/app/data/opendrive.db") but that
    // directory tree doesn't exist on this machine (e.g. local Windows/macOS dev),
    // fall back to a local "data" folder under the content root instead.
    if (Path.IsPathRooted(dbPath))
    {
        if (!Directory.Exists(Path.GetDirectoryName(dbPath)) && !Directory.Exists("/app"))
        {
            dbPath = Path.Combine(builder.Environment.ContentRootPath, "data", "opendrive.db");
        }
    }
    else
    {
        dbPath = Path.Combine(builder.Environment.ContentRootPath, dbPath);
    }

    var dir = Path.GetDirectoryName(dbPath);
    if (!string.IsNullOrEmpty(dir))
    {
        Directory.CreateDirectory(dir);
    }

    return $"{prefix}{dbPath}";
}

var resolvedConnectionString = ResolveSqliteConnectionString(rawConnectionString);

builder.Services.AddDbContext<ApplicationDbContext>(o =>
    o.UseSqlite(resolvedConnectionString));

// ── DI registrations ──────────────────────────────────────────────────────────
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IFileService, FileService>();
builder.Services.AddScoped<IFolderService, FolderService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// ── CORS ──────────────────────────────────────────────────────────────────────
builder.Services.AddCors(o => o.AddPolicy("Frontend", p =>
    p.WithOrigins(
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "https://open-drive-cloud.vercel.app"
    )
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()
));

// ── Swagger ───────────────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "OpenDrive API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Enter: Bearer {token}",
        Name        = "Authorization",
        In          = ParameterLocation.Header,
        Type        = SecuritySchemeType.ApiKey,
        Scheme      = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {{
        new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
        },
        Array.Empty<string>()
    }});
});

// Ensure wwwroot/uploads exists BEFORE building the app, so ASP.NET Core
// discovers the WebRootPath correctly and StaticFiles middleware doesn't warn.
var wwwrootPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot");
var uploadsPath = Path.Combine(wwwrootPath, "uploads");
Directory.CreateDirectory(uploadsPath);
builder.Environment.WebRootPath = wwwrootPath;

var app = builder.Build();

// ── Auto-migrate ──────────────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.Migrate();
        Console.WriteLine("[OpenDrive] Migrations applied.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[OpenDrive] Migration failed: {ex.Message}");
    }
}

// ── Middleware pipeline ───────────────────────────────────────────────────────
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "OpenDrive API v1"));

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();
app.MapControllers();

// Minimal endpoints
app.MapGet("/",        () => "OpenDrive API is running!");
app.MapGet("/health",  () => Results.Ok(new { status = "healthy", utc = DateTime.UtcNow }));
app.MapGet("/ping",    () => Results.Ok("pong")); // keep-alive endpoint

app.Run();
