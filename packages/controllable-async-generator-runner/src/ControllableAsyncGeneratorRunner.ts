import { GeneratorStatus } from "./types/GeneratorStatus";
import { ConstructorParams } from "./types/ConstructorParams";
import { ControllableAsyncGeneratorRunnerInterface } from "./types/ControllableAsyncGeneratorRunnerInterface";
export class ControllableAsyncGeneratorRunner<
	TReturn,
	TNext,
	TNextReturn,
	TGenerateParams,
	TState extends GeneratorStatus = GeneratorStatus
> implements ControllableAsyncGeneratorRunnerInterface<TReturn,
	TNext,
	TNextReturn,
	TGenerateParams>{
	public get state(): TState {
		return this._state;
	}
	private pausePromiseResolve: undefined | ((value?: unknown) => void);
	private readonly generatorGenerator: (
		params?: TGenerateParams
	) => AsyncGenerator<TReturn, TNext, TNextReturn>;
	private readonly handler: (value: TReturn) => unknown;
	private readonly statusEmitter: () => void;
	private readonly generatorParams?: TGenerateParams;

	private readonly initialiseState: () => TState = () =>
		({
			active: false,
			paused: false,
			finished: false,
		} as TState);

	private _state: TState = this.initialiseState() ?? ({} as TState);

	constructor({
		generatorGenerator,
		handler,
		statusEmitter,
		generatorParams,
		initialiseState: initialiseState = () =>
			({
				active: false,
				paused: false,
				finished: false,
			} as TState),
		_state = initialiseState() ?? ({} as TState),
	}: ConstructorParams<TGenerateParams, TReturn, TNext, TNextReturn, TState>) {
		this._state = _state;
		this.initialiseState = initialiseState;
		this.generatorParams = generatorParams;
		this.statusEmitter = statusEmitter;
		this.handler = handler;
		this.generatorGenerator = generatorGenerator;
	}

	run(): void {
		const generator: AsyncGenerator<TReturn, TNext, TNextReturn | undefined> =
			this.generatorGenerator(this.generatorParams);
		const handler = this.handler;
		(async (): Promise<void> => {
			try {
				let next = await generator.next();
				while (this.state.active && !next.done) {
					if (this.state.paused) {
						await new Promise((resolve): void => {
							this.pausePromiseResolve = resolve;
						});
					}
					await handler(next.value);
					next = await generator.next();
				}
				console.debug("ServiceWorker", "generator done");
				this.state.finished = true;
			} catch (error) {
				console.error(error);
			} finally {
				this.stop();
			}
		})();
	}

	start(): void {
		if (!this.state.active) {
			this._state = this.initialiseState();
			this.state.active = true;
			this.run();
		} else if (this.state.paused) {
			console.debug("ServiceWorker", "resuming");
			this.state.paused = false;
			this.state.finished = false;
			if (this.statusEmitter) {
				this.statusEmitter();
			}
			this.pausePromiseResolve?.();
		} else {
			console.warn("ServiceWorker", "already started");
			if (this.statusEmitter) {
				this.statusEmitter();
			}
		}
	}

	pause(): void {
		this.state.paused = true;
		if (this.statusEmitter) {
			this.statusEmitter();
		}
	}

	stop() {
		if (this.state.active) {
			this._state = this.initialiseState();
			this.pausePromiseResolve?.();
		}
		if (this.statusEmitter) {
			this.statusEmitter();
		}
	}
}
