// 라이브러리 로드
import express from 'express';
import cors from 'cors';
// import oracledb, { Connection } from "oracledb";
import axios from 'axios';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const app = express();
// 허용 출처를 프론트 도메인으로 제한 (.env의 CLIENT_ORIGIN)
const clientOrigin = process.env.CLIENT_ORIGIN;
app.use(
  cors({
    origin: clientOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  }),
);
app.use(express.json());
app.listen(3355, () => {
  console.log(`Server is running: http://${process.env.DB_HOST}:3355`);
});

// oracle
/*oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function getConnection() {
  return await oracledb.getConnection({
    username: "",
    password: "",
    connectionString: ":1521/xe"
  });
}
app.get('/board/list-node', async (req, res) => {
  let conn: Connection | undefined;
  const page = parseInt(req.query.page as string) || 1;
  const rowSize = 10;
  const start = (page - 1) * rowSize;
  try {
    conn = await getConnection();
    const sql = `SELECT no, subject, name, TO_CHAR(regdate, 'YYYY-MM-DD') AS dbday, hit 
                 FROM board
                 ORDER BY no DESC
                 OFFSET ${start} ROWS FETCH NEXT ${rowSize} ROWS ONLY`;
    const totalSql = `SELECT CEIL(COUNT(*) / ${rowSize}) AS totalpage
                      FROM board`;
    const result = await conn.execute(sql);
    const total = await conn.execute(totalSql);
    res.json({
      curpage: page,
      totalpage: (total.rows as {TOTALPAGE: number}[])[0].TOTALPAGE,
      list: result.rows
    });
  } catch (e) {
    console.error(e);
  } finally {
    conn?.close();
  }
});*/

// mysql
app.get('/board/list-node', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const rowSize = 10;
  const start = (page - 1) * rowSize;
  try {
    const sql = `SELECT no AS NO, subject AS SUBJECT, name AS NAME,
                        DATE_FORMAT(regdate, '%Y-%m-%d') AS DBDAY, hit AS HIT
                 FROM board
                 ORDER BY no DESC
                 LIMIT ?, ?`;
    const totalSql = `SELECT CEIL(COUNT(*) / ?) AS totalpage FROM board`;
    const [rows] = await db.query(sql, [start, rowSize]);
    const [total] = await db.execute(totalSql, [rowSize]);
    res.json({
      curpage: page,
      totalpage: (total as any[])[0].totalpage,
      list: rows,
    });
  } catch (e) {
    console.error(e);
  }
});

app.post('/board/insert-node', async (req, res) => {
  const { name, subject, content, pwd } = req.body;

  try {
    const sql = `INSERT INTO board(name, subject, content, pwd, regdate, hit, replycount)
                 VALUES(?, ?, ?, ?, NOW(), 0, 0)`;
    await db.execute(sql, [name, subject, content, pwd]);
    res.json({ msg: 'yes' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'no' });
  }
});

app.get('/board/detail-node', async (req, res) => {
  const no = parseInt(req.query.no as string);
  try {
    await db.execute(`UPDATE board SET hit = hit + 1 WHERE no = ?`, [no]);
    const [rows] = await db.execute(
      `SELECT no AS NO, subject AS SUBJECT, content AS CONTENT, name AS NAME,
              hit AS HIT, DATE_FORMAT(regdate, '%Y-%m-%d') AS DBDAY
       FROM board
       WHERE no = ?`,
      [no],
    );
    res.json((rows as any[])[0]);
  } catch (error) {
    console.error(error);
  }
});

app.get('/board/update-node', async (req, res) => {
  const no = parseInt(req.query.no as string);

  try {
    const sql = `SELECT no, name, subject, content 
                 FROM board 
                 WHERE no = ?`;
    const [rows] = await db.execute(sql, [no]);
    res.json((rows as any[])[0]);
  } catch (e) {
    console.error(e);
  }
});

app.put('/board/update-ok-node', async (req, res) => {
  const { no, name, subject, content, pwd } = req.body;

  try {
    const checkSql =
      'SELECT COUNT(*) AS cnt FROM board WHERE no = ? AND pwd = ?';
    const [check] = await db.execute(checkSql, [no, pwd]);
    const count = (check as any[])[0]?.cnt ?? 0;
    if (count === 0) {
      res.json({ msg: 'no' });
      return;
    }

    const updateSql =
      'UPDATE board SET name = ?, subject = ?, content = ? WHERE no = ?';
    await db.execute(updateSql, [name, subject, content, no]);
    res.json({ msg: 'yes' });
  } catch (e) {
    console.error(e);
  }
});

app.delete('/board/delete-node/:no', async (req, res) => {
  const no = parseInt(req.params.no as string);
  const { pwd } = req.body;

  try {
    const checkSql =
      'SELECT COUNT(*) AS cnt FROM board WHERE no = ? AND pwd = ?';
    const [check] = await db.execute(checkSql, [no, pwd]);
    const count = (check as any[])[0]?.cnt ?? 0;
    if (count === 0) {
      res.json({ msg: 'no' });
      return;
    }

    const deleteSql = 'DELETE FROM board WHERE no = ?';
    await db.execute(deleteSql, [no]);
    res.json({ msg: 'yes' });
  } catch (e) {
    console.error(e);
  }
});

// 뉴스 검색
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
app.get('/news/find-node', async (req, res) => {
  const query = req.query.query as string;
  if (!query) {
    return res.status(400).send({ message: '검색어가 없습니다' });
  }
  const api_url =
    'https://openapi.naver.com/v1/search/news.json?display=50&query=' +
    encodeURI(query); // JSON 결과

  await axios
    .create({
      headers: {
        'X-Naver-Client-Id': client_id,
        'X-Naver-Client-Secret': client_secret,
      },
    })
    .get(api_url)
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      res.status(error).end();
    });
});

// 유튜브 검색 (키를 서버에서만 보유 → 프론트 노출 방지)
const youtube_api_key = process.env.YOUTUBE_API_KEY;
app.get('/youtube/find-node', async (req, res) => {
  const query = req.query.query as string;
  if (!query) {
    return res.status(400).send({ message: '검색어가 없습니다' });
  }
  const api_url =
    'https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=28&type=video&q=' +
    encodeURIComponent(query) +
    '&key=' +
    youtube_api_key;

  await axios
    .get(api_url)
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: 'Youtube API 오류' });
    });
});
