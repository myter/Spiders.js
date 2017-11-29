for i in {1..10}
do
	node RunUseCase.js true monitor 2 qprop &
	node RunUseCase.js true data 2 qprop &
	node RunUseCase.js true config 2 qprop &
	node RunUseCase.js true driving 2 qprop &
	node RunUseCase.js true geo 2 qprop &
	node RunUseCase.js true dash 2 qprop
	 sleep 5
done
for i in {1..10}
do
	node RunUseCase.js true monitor 50 qprop &
	node RunUseCase.js true data 50 qprop &
	node RunUseCase.js true config 50 qprop &
	node RunUseCase.js true driving 50 qprop &
	node RunUseCase.js true geo 50 qprop &
	node RunUseCase.js true dash 50 qprop
	 sleep 5
done
for i in {1..10}
do
	node RunUseCase.js true monitor 100 qprop &
	node RunUseCase.js true data 100 qprop &
	node RunUseCase.js true config 100 qprop &
	node RunUseCase.js true driving 100 qprop &
	node RunUseCase.js true geo 100 qprop &
	node RunUseCase.js true dash 100 qprop
	 sleep 5
done
for i in {1..10}
do
	node RunUseCase.js true monitor 150 qprop &
	node RunUseCase.js true data 150 qprop &
	node RunUseCase.js true config 150 qprop &
	node RunUseCase.js true driving 150 qprop &
	node RunUseCase.js true geo 150 qprop &
	node RunUseCase.js true dash 150 qprop
	 sleep 5
done
for i in {1..10}
do
	node RunUseCase.js true monitor 200 qprop &
	node RunUseCase.js true data 200 qprop &
	node RunUseCase.js true config 200 qprop &
	node RunUseCase.js true driving 200 qprop &
	node RunUseCase.js true geo 200 qprop &
	node RunUseCase.js true dash 200 qprop
	 sleep 5
done
for i in {1..10}
do
	node RunUseCase.js true monitor 250 qprop &
	node RunUseCase.js true data 250 qprop &
	node RunUseCase.js true config 250 qprop &
	node RunUseCase.js true driving 250 qprop &
	node RunUseCase.js true geo 250 qprop &
	node RunUseCase.js true dash 250 qprop
	 sleep 5
done
for i in {1..10}
do
	node RunUseCase.js true monitor 300 qprop &
	node RunUseCase.js true data 300 qprop &
	node RunUseCase.js true config 300 qprop &
	node RunUseCase.js true driving 300 qprop &
	node RunUseCase.js true geo 300 qprop &
	node RunUseCase.js true dash 300 qprop
	 sleep 5
done
