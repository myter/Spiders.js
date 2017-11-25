#!/usr/bin/env bash
for i in {1..30}
do
	node RunUseCase.js true monitor 10000 qprop &
	node RunUseCase.js true data 10000 qprop &
	node RunUseCase.js true config 10000 qprop &
	node RunUseCase.js true driving 10000 qprop &
	node RunUseCase.js true geo 10000 qprop &
	node RunUseCase.js true dash 10000 qprop
done
