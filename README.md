# Qubie - QUery BuIlder and Executor

IN DEEP DEVELOPMENT, NOTHING TO SEE HERE, MOVE ON

ТЕСТЫ:

filter после группировки - having?
filter после map
map после filter после map
map map map map map map
map filter map filter map filter map
join после map
join другого датасорса после его map
limit и offset взаимодействуют независимо
join после sortBy...?
sortBy после sortBy после sortBy
sortBy по нескольким полям
sortBy по нескольким полям с разными asc/desc
map на объект (множество полей)
map на одиночное значение
group by по объекту (по нескольким полям)
group by по одиночному значению
group by после group by (по нескольким полям/по одиночному значению)
агрегатные функции в map при group by
limit без sortBy?
insert returning по одному значению
insert returning по нескольким значениям
insert не позволяет все остальные действия с сорсом
update без возвращаемого значения, но с присвоениями внутри
update с возвращаемым значением = объект
вложенные запросы?
кавычки в именах полей/таблиц/переименований правильно экранируются и ваще нормально работают
groupby после take/drop
join после take/drop
тесты на провальные трансформации - использование переменных в качестве функций и т.д.
правильно ли работает трансформер, если объявленный тип переменной - QubieExpression или подобный, но он был переименован при импорте
преобразовывать переменные, помеченные как трансформабельные?
оповещения про any в местах, где это важно
поддержать условные выражения в местах, где ожидаются трансформабельные функции
как относится ttypescript к тому, что трансформер кидает ошибки
не запрашиваем поля, которые не участвуют в результате/условиях. тут мы можем выкинуть даже какие-то джойны (это может быть удобно в случае, например, если у нас есть одна таблица с заказами, куда приджойнены адреса, и мы запрашиваем эту таблицу, но никак адреса не используем и не берем их в результате)
join нескольких сущностей после orderby по второй таблице. тут я боюсь, что для правильного склеивания сущностей строки нужно будет сортировать, что может пойти вразрез с тем orderby, который хочет пользователь
join-ы один-ко-многим с 0 "многих" не теряют "один" в результате

доки:

разница take+drop и limit+offset
разница в поведении group, sortBy и прочей херни вследствие логики про иммутабельность

TODO:
контроль над сериализацией/десериализацией
повторяющиеся имена полей в join-ах? позволять join-ить таблицу как отдельный объект? может, даже позволять собирать сложные объекты в map?
поддержка postgresql json?
распилить этот монолитный кусок кода на отдельные пакеты, и переписать тесты на использование кода попакетно
npm install в тестовых проектах перед запуском собственно тестов
разобраться, каково наше отношение к PropertyAccessExpression и Identifier в коде трансформируемой функции, и как с ними жить вообще
