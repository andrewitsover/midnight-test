select 
    name, 
    heightCm, 
    reachCm, 
    json_group_array(reachCm) over (partition by heightCm) as reaches
from fighters 
where hometown like '%new york%';
