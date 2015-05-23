# mb_test_1

Демо-проект с простеньким API. Детали см. в файле Description.md

## Требования
- Django 1.8
- Django Rest Framework 3.1.1
- django-filter (https://github.com/alex/django-filter)


## Установка

### на серверах

Поднять на удаленной машине можно с помощью команды:

```bash
make deploy
```

Но вначале надо обновить файл: `ansible/production`, указав в нем ваши реквизиты сервера(-ов).


### локально

При наличии VirtualBox и Vagrant на локальной машине, поднять можно с помощью команды:

```bash
vagrant up
```

После чего, ресурс будет доступен по адресу: `http://localhost:8083/`


## Changelog

### 2015/05/22
- (!) сломал тесты
- добавлен EmberJS-клиент в виде приложения `erp_client_emberjs`. На текущий момент доступны только следующие операции: добавить/изменить/удалить. Не работают notifications, validation. Нет возможности добавить/изменить свойства Component. Нет возможности установить/удалить сервер/корзину. При создании нового Node не работает редирект на его страницу; требуется перезагрузка страницы.
- все api-url'ы не должны заканчиваться на '/'
- теперь получить список серверов можно получить и для: `Basket`, `Floor`, `Rack`, `Room`, `Row`, `ServerTemplate`, - и, как и ранее, для `Node`
- для `Serve`r теперь можно получить список установленных компонентов
- `Property` теперь доступен и по имени (например, `/properties/cpu.socket`)
- для `Property` теперь можно получить список доступных `PropertyOption` по адресу в формате: "/properties/{property name}/options". Поддерживаются только `Property.name`. Если передать `Property.id`, вернется ошибка 404.
- результат обращения к API возвращается в формате JSON API (http://jsonapi.org/) 1.0.0 RC3. Пока поддерживается частично.
- в api отключена проверка наличия `properties` при добавлении/изменении Component. Изменить поведение можно поменяв значение переменной `COMPONENT_REQUIRES_WITH_PROPERTIES` на `True` в файле `erp_test/defaults.py`
- WebUI теперь доступен и по адресу '/client/'
- добавлены поля `created_at`, `updated_at` в модели `Node`, `Floor`, `Room`, `Row`, `Rack`, `Unit`, `Component`, `ServerTemplate`, `Server`, `Basket`
- добавлено поле `servers_count` в модель `Node`
- добавлено поле `node` в модель `Room`
- добавлены поля `node`, `floor` в модель `Row`
- добавлены поля `floor`, `room`, `row`, в модель `Server`
- добавлено поле `servers_count` в модель `Node`
- добавлено поле `servers_uses` в модель `ServerTemplate`

### 2015/05/01
- в WebUI добавлена возможность добавлять/изменять/удалять записи

### 2015/04/30
- изменен api-адрес на `/api/v1/`
- добавлен WebUI для просмотра данных. Находится по адресу: `/client/nodes/`
