for i in {1..30}
do
	node RunUseCase.js false admitter 2 sidup &
	node RunUseCase.js false monitor 2 sidup &
	node RunUseCase.js false data 2 sidup &
	node RunUseCase.js false config 2 sidup &
	node RunUseCase.js false driving 2 sidup &
	node RunUseCase.js false geo 2 sidup &
	node RunUseCase.js false dash 2 sidup
done
for i in {1..30}
do
	node RunUseCase.js false admitter 10 sidup &
	node RunUseCase.js false monitor 10 sidup &
	node RunUseCase.js false data 10 sidup &
	node RunUseCase.js false config 10 sidup &
	node RunUseCase.js false driving 10 sidup &
	node RunUseCase.js false geo 10 sidup &
	node RunUseCase.js false dash 10 sidup
done
for i in {1..30}
do
	node RunUseCase.js false admitter 100 sidup &
	node RunUseCase.js false monitor 100 sidup &
	node RunUseCase.js false data 100 sidup &
	node RunUseCase.js false config 100 sidup &
	node RunUseCase.js false driving 100 sidup &
	node RunUseCase.js false geo 100 sidup &
	node RunUseCase.js false dash 100 sidup
done
for i in {1..30}
do
	node RunUseCase.js false admitter 1000 sidup &
	node RunUseCase.js false monitor 1000 sidup &
	node RunUseCase.js false data 1000 sidup &
	node RunUseCase.js false config 1000 sidup &
	node RunUseCase.js false driving 1000 sidup &
	node RunUseCase.js false geo 1000 sidup &
	node RunUseCase.js false dash 1000 sidup
done
for i in {1..30}
do
	node RunUseCase.js false admitter 10000 sidup &
	node RunUseCase.js false monitor 10000 sidup &
	node RunUseCase.js false data 10000 sidup &
	node RunUseCase.js false config 10000 sidup &
	node RunUseCase.js false driving 10000 sidup &
	node RunUseCase.js false geo 10000 sidup &
	node RunUseCase.js false dash 10000 sidup
done
