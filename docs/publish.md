# Инструкция публикации в npm

## Автоматическая публикация
Workflow [sync-icons](../.github/workflows/sync-icons.yml) ежедневно проверяет новые версии `@vkontakte/icons`.
Когда выходит новая версия, он обновляет зависимость, выставляет библиотеке ту же версию, перегенерирует иконки, публикует пакет в npm и коммитит `release: X` с тегом `vX`.
Запустить проверку вручную можно на вкладке Actions → «Sync @vkontakte/icons» → Run workflow.

Мажорные обновления `@vkontakte/icons` автоматически не публикуются: workflow падает с ошибкой, и обновление нужно выполнить вручную.

Публикация работает через npm Trusted Publishing, поэтому токен не нужен. Однократная настройка выполняется на npmjs.com:
`vue-vkontakte-icons` → Settings → Trusted Publisher → GitHub Actions, где указываются `ivanmem` / `vue-vkontakte-icons` / `sync-icons.yml`.

## Ручная публикация
1. Инкрементируем версию библиотеки в `package.json`.
2. Выполняем команды
```shell
    npm run generate-icons
    npm run build
    npm login
    npm publish
```
3. Дожидаемся появления версии в [npm](https://www.npmjs.com/package/vue-vkontakte-icons).
4. По необходимости обновляем библиотеку в своём проекте
```shell
  npm install vue-vkontakte-icons@latest
```
