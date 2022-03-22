# Qubie - QUery BuIlder and Executor

IN DEEP DEVELOPMENT, NOTHING TO SEE HERE, MOVE ON

ТЕСТЫ:

сравнения со строковыми литералами
деструктуризация в объявлении параметров функций (в том числе с переименованием)
concat vs addition, особенно в случае смешанных типов, например (string | number) + (string | number)
тесты на приведение к boolean чисел, строк, смешанных типов
unary minus
expressions in (parenthesis)
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
не запрашиваем поля, которые не участвуют в результате/условиях. тут мы можем выкинуть даже какие-то джойны (это может быть удобно в случае, например, если у нас есть одна таблица с заказами, куда приджойнены адреса, и мы запрашиваем эту таблицу, но никак адреса не используем и не берем их в результате)
join нескольких сущностей после orderby по второй таблице. тут я боюсь, что для правильного склеивания сущностей строки нужно будет сортировать, что может пойти вразрез с тем orderby, который хочет пользователь
join-ы один-ко-многим с 0 "многих" не теряют "один" в результате
поддержка enum-ов в переменных?
проверка на is (not) null генерируется правильно
переименования полей, всякая херня в полях, всякая херня в именах таблиц

доки:

разница take+drop и limit+offset
разница в поведении group, sortBy и прочей херни вследствие логики про иммутабельность
connector и что за ним может стоять (pooling, api call bound context, whatever)

TODO:
map embedded string methods and fields (length) for SQL expressions
контроль над сериализацией/десериализацией
повторяющиеся имена полей в join-ах? позволять join-ить таблицу как отдельный объект? может, даже позволять собирать сложные объекты в map?
поддержка postgresql json? и тесты на глубокую деструктуризацию параметров функций, если поддержка json будет
imploder: better module naming when packing into package; new Function instead of eval
попробовать поюзать runtyper в проекте без Imploder. если будут проблемы со сборкой и/или построением .d.ts (опция про чек библиотек при построении, или юзай dts-builder) - отвязать от toolbox-transformer и проделать то же самое для этого пакета
как относится ttypescript к тому, что трансформер кидает ошибки

Publish script todo:
настроить прокидывание этого readme вместо readme в core
qubie-pg зависит от pg как peer dependency
peer dependency core от transformer? может ли dev dependency удовлетворить peer dependency?
bump all internal dependency versions to latest when publishing, and make all latest versions be one
check all .d.ts for leaks
review transformer parameters, throw away unused
