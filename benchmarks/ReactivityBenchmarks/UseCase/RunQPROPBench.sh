#!/usr/bin/env bash
for i in {1..30}
do
	node RunTestCase.js true monitor 10000 qprop &
	node RunTestCase.js true data 10000 qprop &
	node RunTestCase.js true config 10000 qprop &
	node RunTestCase.js true driving 10000 qprop &
	node RunTestCase.js true geo 10000 qprop &
	node RunTestCase.js true dash 10000 qprop
done
