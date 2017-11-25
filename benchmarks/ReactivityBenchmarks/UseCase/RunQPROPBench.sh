#!/usr/bin/env bash
for i in {1..30}
do
	node MaxThroughput.js --max_old_space_size=12000 true monitor 10000 qprop &
	node MaxThroughput.js --max_old_space_size=12000 true data 10000 qprop &
	node MaxThroughput.js --max_old_space_size=12000 true config 10000 qprop &
	node MaxThroughput.js --max_old_space_size=12000 true driving 10000 qprop &
	node MaxThroughput.js --max_old_space_size=12000 true geo 10000 qprop &
	node MaxThroughput.js --max_old_space_size=12000 true dash 10000 qprop
done
