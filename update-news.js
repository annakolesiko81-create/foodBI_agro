/**
 * FoodBI Агро — обновление блока новостей
 * Запуск: node update-news.js
 *
 * Читает news.json и вшивает новости в index.html как статический HTML.
 * Статический HTML = максимум SEO (Google индексирует мгновенно).
 */

const fs   = require('fs');
const path = require('path');

const NEWS_FILE  = path.join(__dirname, 'news.json');
const HTML_FILE  = path.join(__dirname, 'index.html');

// --- читаем файлы ---
const newsData = JSON.parse(fs.readFileSync(NEWS_FILE, 'utf8'));
const html     = fs.readFileSync(HTML_FILE, 'utf8');

// --- формируем HTML-карточки ---
const cards = newsData.news.map(item => `    <a href="${item.url}" class="news-card">
      <div class="news-date">${item.date}</div>
      <h4>${item.title}</h4>
      <p>${item.text}</p>
    </a>`).join('\n');

const newGrid = `<div class="news-grid">\n${cards}\n  </div>`;

// --- заменяем блок между маркерами ---
const START = '<div class="news-grid">';
const END   = '</div>';

const startIdx = html.indexOf(START);
if (startIdx === -1) {
  console.error('❌  Маркер news-grid не найден в index.html');
  process.exit(1);
}

// находим закрывающий тег блока (учитываем вложенность)
let depth = 0;
let endIdx = startIdx;
for (let i = startIdx; i < html.length - 5; i++) {
  if (html.slice(i, i + 4) === '<div') depth++;
  if (html.slice(i, i + 6) === '</div>') {
    depth--;
    if (depth === 0) { endIdx = i + 6; break; }
  }
}

const updatedHtml =
  html.slice(0, startIdx) +
  newGrid +
  html.slice(endIdx);

fs.writeFileSync(HTML_FILE, updatedHtml, 'utf8');

// --- обновляем дату в news.json ---
newsData.updated = new Date().toISOString().slice(0, 10);
fs.writeFileSync(NEWS_FILE, JSON.stringify(newsData, null, 2), 'utf8');

console.log('✅  Новости обновлены в index.html');
console.log(`📰  Дата: ${newsData.updated}`);
newsData.news.forEach((n, i) => console.log(`   ${i + 1}. ${n.title}`));
