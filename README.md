# Сайт команды Code&Brew

Статический сайт на HTML, CSS и JavaScript без сборки. Его можно сразу выложить на GitHub Pages.

## Страницы

| Файл | Что это |
|------|---------|
| `index.html` | Главная: 3D-чашка, о команде, услуги, проекты, процесс, хакатоны, команда, контакты |
| `projects.html` | Галерея проектов с фильтрами |
| `project.html?p=<slug>` | Страница одного проекта (собирается из `data.js`) |
| `events.html` | Хакатоны и конференции: таймлайн и сертификаты |
| `team.html` | Команда, университет, приглашённые участники |

## Как поменять тексты

Все тексты о проектах, команде и событиях лежат в одном файле: `assets/js/data.js`.
Чтобы добавить проект или событие, допишите объект в нужный список. Страницы обновятся сами.

## Как посмотреть локально

Сайт использует JS-модули, поэтому двойной щелчок по `index.html` не подойдёт. Нужен локальный сервер:

```bash
python -m http.server 5180
```

Затем откройте http://localhost:5180

## Где опубликован

Сайт: https://matfix-coder.github.io/code-brew/
Репозиторий: https://github.com/MATFIX-coder/code-brew (ветка `main`, GitHub Pages из корня)

Чтобы обновить сайт, закоммитьте изменения в папке `site` и выполните `git push` — GitHub Pages пересоберётся за 1–2 минуты.

## Как опубликовать на GitHub Pages заново

1. Создайте в организации Code-Brew-Git-Hub репозиторий, например `code-brew-git-hub.github.io` или `site`.
2. Загрузите в него содержимое папки `site/`.
3. Откройте Settings → Pages → Source: ветка `main`, папка `/ (root)`.
4. Сайт появится по адресу `https://code-brew-git-hub.github.io/` (или `/site/`).

## Что осталось сделать

- [x] Контакты: почта aksdim82@gmail.com и Telegram всех участников с QR-кодами (`assets/img/qr/`).
- [x] AlphaForge Autopilot (MOEX AI Hackathon): описание по репозиторию MOEX-hack. Репозиторий приватный, поэтому ссылки на код нет.
- [ ] Скриншоты дашборда AlphaForge — добавить в `gallery`, если появятся.

QR-коды пересоздаются так (нужен пакет `segno`): `segno.make('https://t.me/<ник>').save('<ник>.svg', scale=8, border=2)`.

## Библиотеки (лежат в `assets/vendor`)

Three.js 0.160.0 · GSAP 3.12.5 + ScrollTrigger · Lenis 1.1.13 · шрифты Unbounded, Manrope, JetBrains Mono (Google Fonts)
