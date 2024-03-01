import { GeneratorStatus } from "./types/GeneratorStatus";

export type SyncOrAsyncGenerator<C> = Generator<C> | AsyncGenerator<C>;

export interface GeneratorRunnerInterface<
	P,
	C,
	G extends SyncOrAsyncGenerator<C>
> {
	builderParams: P;
	builder: (p: P) => G;
	handleNext: (value: G["next"]) => void;
	handleReturn: (value: G["return"]) => void;
	handleThrow: (value: G["throw"]) => void;
	_generator: G;
}

export interface ControllableGeneratorRunnerInterface<
	P,
	C,
	G extends SyncOrAsyncGenerator<C>,
	S extends GeneratorStatus = GeneratorStatus
> extends GeneratorRunnerInterface<P, C, G> {
	start: () => void;
	pause: () => void;
	stop: () => void;
	_status: S;
	reportStatus: () => S;
}

export abstract class AbstractControllableGeneratorRunner<
	P,
	C,
	G extends SyncOrAsyncGenerator<C>,
	Status extends GeneratorStatus = GeneratorStatus
> implements ControllableGeneratorRunnerInterface<P, C, G, Status>
{
	abstract builderParams: P;
	abstract _generator: G;
	abstract start(): void;
	abstract pause(): void;
	abstract stop(): void;
	abstract reportStatus(): Status;
	abstract builder: (p: P) => G;
	abstract handleNext: (value: G["next"]) => void;
	abstract handleReturn: (value: G["return"]) => void;
	abstract handleThrow: (value: G["throw"]) => void;
	abstract _status: Status;
}

export abstract class ControllableGeneratorRunner<
	P,
	C,
	G extends SyncOrAsyncGenerator<C>,
	S extends GeneratorStatus = GeneratorStatus
> extends AbstractControllableGeneratorRunner<P, C, G, S> {
	_status: S;
	builderParams: P;
	builder: (p: P) => G;
	handleNext: (value: G["next"]) => void;
	handleReturn: (value: G["return"]) => void;
	handleThrow: (value: G["throw"]) => void;

	constructor({
		builder,
		builderParams,
		handleNext,
		handleReturn,
		handleThrow,
	}: GeneratorRunnerInterface<P, C, G>) {
		super();
		this.builder = builder;
		this.builderParams = builderParams;
		this.handleNext = handleNext;
		this.handleReturn = handleReturn;
		this.handleThrow = handleThrow;
		this._status = this.initialiseStatus();
	}

	initialiseStatus(): S {
		return {
			active: false,
			paused: false,
			finished: false,
		} as S;
	}

	_generator: G = this.builder(this.builderParams);

	start(): void {
		this._status.active = true;
		this._status.paused = false;
		this._status.finished = false;
	}

	pause(): void {
		this._status.active = false;
		this._status.paused = true;
	}

	stop(): void {
		this._status.active = false;
		this._status.paused = false;
		this._status.finished = true;
	}

	reportStatus(): S {
		return this._status;
	}
}

export class SyncControllableGeneratorRunner<
	P,
	C,
	G extends Generator<C> = Generator<C>,
	S extends GeneratorStatus = GeneratorStatus
> extends ControllableGeneratorRunner<P, C, G, S> {
	_generator: G = this.builder(this.builderParams);
	next: IteratorResult<C> = this._generator.next();
}
export class AsyncControllableGeneratorRunner<
	P,
	C,
	G extends AsyncGenerator<C> = AsyncGenerator<C>,
	S extends GeneratorStatus = GeneratorStatus
> extends ControllableGeneratorRunner<P, C, G, S> {
	_generator: G = this.builder(this.builderParams);
	next: Promise<IteratorResult<C>> = this._generator.next();
}

const increment: number = 10;
const iterations: number = 10;
function* generator(increment: number): Generator<number, void, unknown> {
	let i = 0;
	let value = 0;
	while (i < iterations) {
		value += increment;
		yield value;
		i++;
	}
}

async function* asyncGenerator(
	increment: number
): AsyncGenerator<number, void, unknown> {
	let i = 0;
	let value = 0;
	while (i < iterations) {
		value += increment;
		yield value;
		i++;
	}
}

const syncRunner = new SyncControllableGeneratorRunner({
	builder: (params: number) => generator(params),
	builderParams: increment,
	_generator: generator(increment),
	handleNext: (value) => console.log(value),
	handleReturn: (value) => console.log(value),
	handleThrow: (value) => console.log(value),
});

const asyncRunner = new AsyncControllableGeneratorRunner({
	builder: (params: number) => asyncGenerator(params),
	builderParams: increment,
	_generator: asyncGenerator(increment),
	handleNext: (value) => console.log(value),
	handleReturn: (value) => console.log(value),
	handleThrow: (value) => console.log(value),
});
