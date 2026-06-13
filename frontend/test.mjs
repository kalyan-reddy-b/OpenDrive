import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIwZTM4ZTk5OC0zMjIzLTRhNWQtOGM0Yy0wM2RjZWI1N2FkODAiLCJ1bmlxdWVfbmFtZSI6InRlc3R1c2VyIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IlVzZXIiLCJuYmYiOjE3ODEzNTU0NzksImV4cCI6MTc4MTM1OTA3OSwiaWF0IjoxNzgxMzU1NDc5LCJpc3MiOiJPcGVuRHJpdmVBUEkiLCJhdWQiOiJPcGVuRHJpdmVVc2VycyJ9.WMCiLnv9dk-3C_7qaS-TufiDd2lMsQ_xgFqzpBamgoQ';

async function test() {
  const params = { isTrash: false, pageSize: 100 };
  const res = await api.get('/Files', { params, headers: { Authorization: 'Bearer ' + token } });
  console.log('Result:', res.data);
}
test();
