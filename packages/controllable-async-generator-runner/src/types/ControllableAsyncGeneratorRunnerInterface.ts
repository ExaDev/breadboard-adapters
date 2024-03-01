import { GeneratorStatus } from "./GeneratorStatus";

export type RunnerTypes<
	TReturn,
	TNext,
	TNextReturn,
	TGenerateParams,
	TState extends GeneratorStatus
> = {
	TReturn: TReturn;
	TNext: TNext;
	TNextReturn: TNextReturn;
	TGenerateParams: TGenerateParams;
	TState: TState;
};

export type GeneratorType<T> = T extends Generator<infer TReturn, any, any>	? TReturn : never;

export interface GeneratorConstructorParams<
	T extends RunnerTypes<any, any, any, any, any>,
		// G extends Generator<T["TReturn"], T["TNext"], T["TNextReturn"]> | AsyncGenerator<T["TReturn"], T["TNext"], T["TNextReturn"]>
		G extends GeneratorType<T["TGenerateParams"]>
> {
	handler: (value: T["TReturn"]) => unknown;
	statusEmitter: () => void;
	generatorParams?: T["TGenerateParams"];
	initialiseState?: () => T["TState"];
	_state?: T["TState"];
		generatorBuilder: (
		params?: T["TGenerateParams"]
	) => G;
}

// export interface SyncGeneratorConstructorParams<
// 	T extends RunnerTypes<any, any, any, any, any>
// > extends GeneratorConstructorParams<T> {
// 	generatorBuilder: (
// 		params?: T["TGenerateParams"]
// 	) => Generator<T["TReturn"], T["TNext"], T["TNextReturn"]>;
// }

// export interface Testttttt<
// 	T extends RunnerTypes<any, any, any, any, any>,
// 	G extends Generator<T["TReturn"], T["TNext"], T["TNextReturn"]> | AsyncGenerator<T["TReturn"], T["TNext"], T["TNextReturn"]>
// > extends GeneratorConstructorParams<T> {
// 	generatorBuilder: (
// 		params?: T["TGenerateParams"]
// 	) => G;
// }

// export interface AsyncGeneratorConstructorParams<
// 	T extends RunnerTypes<any, any, any, any, any>,
// 	G extends GeneratorType<T["TGenerateParams"]>
// > {
// 	generatorBuilder: (
// 		params?: T["TGenerateParams"]
// 	) => AsyncGenerator<T["TReturn"], T["TNext"], T["TNextReturn"]>;
// }

export interface ControllableRunner<
	T extends RunnerTypes<any, any, any, any, any>
> {
	readonly state: T["TState"];
	readonly generatorParams?: T["TGenerateParams"];
}

export abstract class AbstractControllableRunner<
	T extends RunnerTypes<any, any, any, any, any>
> implements ControllableRunner<T>
{
	public get state(): T["TState"] {
		return this._state;
	}
	readonly handler: (value: T["TReturn"]) => unknown;
	readonly statusEmitter: () => void;
	readonly generatorParams?: T["TGenerateParams"];

	readonly initialiseState: () => T["TState"] = () =>
		({
			active: false,
			paused: false,
			finished: false,
		} as T["TState"]);

	_state: T["TState"] = this.initialiseState() ?? {};

	constructor({
		generatorBuilder,
		handler,
		statusEmitter,
		generatorParams,
		initialiseState: initialiseState = () => ({
			active: false,
			paused: false,
			finished: false,
		}),
		_state = initialiseState() ?? {},
	}: SyncGeneratorConstructorParams<T>) {
		this._state = _state;
		this.initialiseState = initialiseState;
		this.generatorParams = generatorParams;
		this.statusEmitter = statusEmitter;
		this.handler = handler;
		this.generatorBuilder = generatorBuilder;
	}

	abstract run(): void;
	abstract start(): void;
	abstract pause(): void;
	abstract stop(): void;
}

export abstract class AbstractSyncControllableRunner<
	T extends RunnerTypes<any, any, any, any, any>
> extends AbstractControllableRunner<T> 
	implements ControllableRunner<T>	{
	abstract run(): void;
	readonly generatorBuilder: (
		params?: T["TGenerateParams"]
	) => Generator<T["TReturn"], T["TNext"], T["TNextReturn"]>;
}

export interface AsyncControllableRunner<
	T extends RunnerTypes<any, any, any, any, any>
> extends ControllableRunner<T> {
	pausePromiseResolve: undefined | ((value?: unknown) => void);
}

export abstract class AbstractAsyncControllableRunner<
		T extends RunnerTypes<any, any, any, any, any>
	>
	extends AbstractControllableRunner<T>
	implements AsyncControllableRunner<T>
{
	pausePromiseResolve: undefined | ((value?: unknown) => void);
	abstract run(): Promise<void>;
	readonly generatorBuilder: (
		params?: T["TGenerateParams"]
	) => AsyncGenerator<T["TReturn"], T["TNext"], T["TNextReturn"]>;
		
}
