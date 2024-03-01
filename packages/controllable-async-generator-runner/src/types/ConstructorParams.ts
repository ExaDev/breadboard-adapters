import { GeneratorTypes } from "./ControllableAsyncGeneratorRunnerInterface";

export interface ConstructorParams<
	T extends GeneratorTypes<any, any, any, any, any>
> {
	generatorGenerator: (
		params?: T["TGenerateParams"]
	) => AsyncGenerator<T["TReturn"], T["TNext"], T["TNextReturn"]>;
	handler: (value: T["TReturn"]) => unknown;
	statusEmitter: () => void;
	generatorParams?: T["TGenerateParams"];
	initialiseState?: () => T["TState"];
	_state?: T["TState"];
}
