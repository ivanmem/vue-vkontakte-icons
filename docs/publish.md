# Инструкция публикации в npm
1. Инкрементируем версию библиотеки в `package.json`.
2. Выполняем команды
```shell
    npm run generate-icons
    npm run build
    npm login
    npm publish --tag beta
```
3. Дожидаемся появления версии в [npm](https://www.npmjs.com/package/vue-vkontakte-icons).
4. По необходимости обновляем библиотеку в своём проекте
```shell
  npm install vue-vkontakte-icons@latest
```