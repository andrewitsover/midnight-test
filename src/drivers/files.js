const files = {
    tables: `create table weightClasses (
    id integer primary key,
    name text not null,
    weightLbs integer not null,
    gender text not null check (gender in ('m', 'f'))
);

create table locations (
    id integer primary key,
    name text not null,
    address text not null,
    lat real not null,
    long real not null
);

create table events (
    id integer primary key,
    name text not null,
    startTime date not null,
    locationId integer references locations on delete cascade
);

create index eventsStartTimeIndex on events(startTime);

create table cards (
    id integer primary key,
    eventId integer not null references events on delete cascade,
    cardName text not null,
    cardOrder integer not null,
    startTime date
);

create index cardsEventIdIndex on cards(eventId);

create table coaches (
    id integer primary key,
    name text not null,
    city text not null,
    profile json
);

create table fighters (
    id integer primary key,
    name text not null,
    nickname text,
    born text,
    heightCm integer,
    reachCm integer,
    hometown text not null,
    social json,
    isActive boolean not null,
    phone json,
    documents json
);

create index fightersIsActiveIndex on fighters(isActive);

create table otherNames (
    id integer primary key,
    fighterId integer not null references fighters on delete cascade,
    name text not null
);

create table fighterCoaches (
    id integer primary key,
    coachId integer not null references coaches on delete cascade,
    fighterId integer not null references fighters on delete cascade,
    startDate text not null,
    endDate text,
    unique(fighterId, coachId)
);

create table rankings (
    id integer primary key,
    fighterId integer not null references fighters on delete cascade,
    weightClassId integer not null references weightClasses on delete cascade,
    rank integer not null,
    isInterim boolean not null
);

create index rankingsRankIndex on rankings(rank) where rank = 0;

create table methods (
    id integer primary key,
    name text not null,
    abbreviation text not null
);

create table fights (
    id integer primary key,
    cardId integer not null references cards on delete cascade,
    fightOrder integer not null,
    blueId integer not null references fighters on delete cascade,
    redId integer not null references fighters on delete cascade,
    winnerId integer references fighters on delete cascade,
    methodId integer references methods on delete cascade,
    methodDescription text,
    endRound integer,
    endSeconds integer,
    titleFight boolean not null,
    isInterim boolean not null,
    weightClassId integer references weightClasses on delete cascade,
    oddsBlue integer,
    oddsRed integer,
    catchweightLbs real
);

create index fightsEventCardIdIndex on fights(cardId);
create index fightsBlueIdIndex on fights(blueId);
create index fightsRedIdIndex on fights(redId);

create table cancelledFights (
    id integer primary key,
    cardId integer not null references cards on delete cascade,
    cardOrder integer not null,
    blueId integer not null references fighters on delete cascade,
    redId integer not null references fighters on delete cascade,
    cancelledAt date not null,
    cancellationReason text
);

create index cancelledFightsCardIdIndex on cancelledFights(cardId);

create table titleRemovals (
    id integer primary key,
    fighterId integer not null references fighters on delete cascade,
    weightClassId integer not null references weightClasses on delete cascade,
    isInterim boolean not null,
    removedAt date not null,
    reason text not null
);

create index titleRemovalsFighterIdIndex on titleRemovals(fighterId);

create virtual table fighterProfiles using fts5(
    name, 
    hometown, 
    content=fighters, 
    content_rowid=id
);

create trigger fighters_ai after insert on fighters begin
    insert into fighterProfiles(rowid, name, hometown) values (new.rowid, new.name. new.hometown);
end;

create trigger fighters_ad after delete on fighters begin
    insert into fighterProfiles(fighterProfiles, rowid, name, hometown) values ('delete', old.rowid, old.name, old.hometown);
end;

create trigger fighters_au after update on fighters begin
    insert into fighterProfiles(fighterProfiles, rowid, name, hometown) values ('delete', old.rowid, old.name, old.hometown);
    insert into fighterProfiles(rowid, name, hometown) values (new.rowid, new.name, new.hometown);
end;`,
    views: `create view opponents as
with eventFights as (
    select
        f.id as fightId,
        e.startTime as startTime,
        f.redId,
        f.blueId,
        f.methodId
    from
        fights f join
        cards c on f.cardId = c.id join
        events e on c.eventId = e.id
)
select
    fightId,
    startTime,
    redId as fighterId,
    blueId as opponentId,
    methodId
from eventFights
union all
select
    fightId,
    startTime,
    blueId as fighterId,
    redId as opponentId,
    methodId
from eventFights;`,
    queries: {coaches: {from: `select id from coaches;
`},events: {from: `select 1 + 2 as test`,lag: `select 
    lag(locationId + 1) over win as test1,
    lag(locationId + 1, 1) over win as test2,
    first_value((locationId + 1) * 2) over win as test3
from events
window win as (order by locationId);
`,operator: `select 
    row_number() over (order by id) - row_number() over (order by name) as result
from events 
limit 4;
`,spaces: `select 

id,

name,
json_group_array(  json_object  ('id',   id,   
'name',
name
)) as test
from     events

limit    2;
`,test: `select
    id,
    object(name, startTime) as nest
from events limit 5;
`},fighters: {byHeight: `select 
    name, 
    heightCm, 
    row_number() over (order by heightCm desc) as heightRank 
from fighters 
where hometown like '%Las Vegas%' 
order by name;
`,common: `with common as (
    select opponentId from opponents 
    where fighterId = $fighter1 and methodId is not null
    intersect
    select opponentId from opponents 
    where fighterId = $fighter2 and methodId is not null
)
select
    object(
        rf.id, 
        rf.name) as red,
    object(
        bf.id, 
        bf.name) as blue,
    f.winnerId,
    m.name as method,
    f.methodDescription as description,
    object(
        e.id, 
        e.name, 
        e.startTime as date) as event
from 
    opponents o join
    fights f on o.fightId = f.id join
    fighters rf on f.redId = rf.id join
    fighters bf on f.blueId = bf.id join
    methods m on f.methodId = m.id join
    cards c on f.cardId = c.id join
    events e on c.eventId = e.id 
where 
    o.fighterId in ($fighter1, $fighter2) and 
    o.opponentId in (select opponentId from common)
order by o.opponentId

`,extract: `select json_extract(social, $path) as instagram from fighters where id = 2`,filter: `select 
    name, 
    group_concat(reachCm, ', ') 
        filter (where heightCm > 180) 
        over (order by born) as reaches
from fighters 
limit 2;
`,instagram: `select social ->> 'instagram' as instagram 
from fighters 
where social is not null 
limit 5
`,lastFights: `with dates as (
    select groupArray(startTime) as dates 
    from opponents
    where fighterId = $id
)
select f.name, d.dates 
from fighters f join dates d
where id = $id
`,left: `select
    f.id,
    f.winnerId,
    w.name as winnerName
from
    fights f left join
    fighters w on f.winnerId = w.id
where f.winnerId is null
limit 5
`,methods: `select m.name as method, count(*) as count
from 
    fights f join
    methods m on f.methodId = m.id
where f.winnerId = $id
group by m.id
`,opponents: `select
    o.opponentId,
    f.name
from
    opponents o join
    fighters f on o.opponentId = f.id
where
    o.fighterId = 17
`,otherNames: `select
    f.name,
    groupArray(o.name) as otherNames
from
    fighters f left join
    otherNames o on o.fighterId = f.id
group by f.id
limit 5
`,right: `select
    f.id,
    f.winnerId,
    w.name as winnerName
from
    fights f join
    fighters w on f.winnerId = w.id
limit 5
`,weightClasses: `with weights as (
    select o.fighterId, f.weightClassId, w.name
    from
        opponents o join
        fights f on o.fightId = f.id join
        weightClasses w on f.weightClassId = w.id
    group by
        o.fighterId, f.weightClassId
),
weightsObjects as (
    select 
        fighterId, 
        groupArray(
            object(
                weightClassId as id, 
                name,
                true as test,
                object(1 as id, true as age) as nest
            )) as weightClasses
    from weights
    group by fighterId
)
select f.name, w.weightClasses
from fighters f join weightsObjects w on w.fighterId = f.id
where f.id = $fighterId
`,withReach: `select 
    name, 
    heightCm, 
    reachCm, 
    groupArray(reachCm) over (partition by heightCm) as reaches
from fighters 
where hometown like '%new york%';
`},fights: {byFighter: `select
    o.name as opponent,
    f.winnerId = $id as win,
    f.winnerId,
    m.name as method,
    f.methodDescription,
    e.name as eventName,
    e.startTime,
    f.endRound,
    f.endSeconds,
    f.titleFight,
    l.name
from
    fights f join
    fighters o on case when f.redId = $id then f.blueId = o.id else f.redId = o.id end join
    fighters bf on f.blueId = bf.id join
    methods m on f.methodId = m.id join
    cards c on f.cardId = c.id join
    events e on c.eventId = e.id join
    locations l on e.locationId = l.id
where f.blueId = $id or f.redId = $id
order by e.startTime desc
    `,error: `select id rom something`},locations: {byId: `select * from locations where id = $id;`,byMethod: `select
    l.id,
    l.name,
    count(distinct f.id) as count
from
    locations l join
    events e on l.id = e.locationId join
    cards c on c.eventId = e.id join
    fights f on f.cardId = c.id
where
    f.methodId = $id
group by l.id
order by count desc
`,detailedEvents: `select
    l.name,
    groupArray(e.id, e.name order by e.id) as events
from 
    locations l join
    events e on e.locationId = l.id
where l.id in (27, 28)
group by l.id;
`,events: `select
    l.name,
    groupArray(e.name order by e.name desc) as events
from 
    locations l join
    events e on e.locationId = l.id
where l.id in (27, 28)
group by l.id;
`,winners: `select
    l.name as location,
    f.name as fighter,
    f.wins
from
    locations l join
    (
        select
            f.id,
            f.name,
            e.locationId,
            count(*) as wins,
            row_number() over (partition by e.locationId order by count(*) desc) as rowNumber
        from
            fights ft join
            cards c on ft.cardId = c.id join
            events e on c.eventId = e.id join
            fighters f on ft.winnerId = f.id
        group by e.locationId, f.id
    ) f on f.locationId = l.id
where 
    f.rowNumber = 1 and 
    wins > 3
order by wins desc
        `},methods: {byFighter: `select m.name as method, count(*) as count
from 
    fights f join
    methods m on f.methodId = m.id
where f.winnerId = $fighterId
group by m.id
`,coach: `select 
    profile ->> '$.medical.fit' as fit,
    profile -> '$.medical.nested.test[1]' as test,
    profile -> '$.tests' as tests,
    profile
from coaches where profile is not null`,topSubmission: `select 
    f.methodDescription
from 
    fights f join
    methods m on f.methodId = m.id
where f.methodId = 2
group by f.methodDescription
order by count(*) desc
limit 1
`}}
}; export default files;
