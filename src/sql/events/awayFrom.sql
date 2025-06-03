select *, timediff(startTime, $date) as diff from events;
