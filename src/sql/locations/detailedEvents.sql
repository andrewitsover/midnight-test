select
    l.name,
    json_group_array(
        json_object(
            'id', e.id, 
            'name', e.name) order by e.id) as events
from 
    locations l join
    events e on e.locationId = l.id
where l.id in (27, 28)
group by l.id;
