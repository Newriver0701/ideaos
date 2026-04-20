const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// データベース接続設定（Railwayの環境変数を使用）
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// 初回起動時にテーブルを自動作成
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ideas (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error('Table creation error:', err);
  }
};
initDB();

// アイデア一覧を表示するルート
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ideas ORDER BY created_at DESC');
    res.render('index', { ideas: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('データベースエラーが発生しました');
  }
});

// アイデアを保存するルート
app.post('/add', async (req, res) => {
  const { content } = req.body;
  if (content) {
    try {
      await pool.query('INSERT INTO ideas (content) VALUES ($1)', [content]);
    } catch (err) {
      console.error(err);
    }
  }
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`サーバーがポート ${port} で起動しました`);
});