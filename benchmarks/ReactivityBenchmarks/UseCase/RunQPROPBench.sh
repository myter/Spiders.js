#!/usr/bin/env bash
for i in {1..30}
do
	node MaxThroughput.js true monitor 10000 qprop &
	node MaxThroughput.js true data 10000 qprop &
	node MaxThroughput.js true config 10000 qprop &
	node MaxThroughput.js true driving 10000 qprop &
	node MaxThroughput.js true geo 10000 qprop &
	node MaxThroughput.js true dash 10000 qprop
done
