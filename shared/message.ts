import type { ZodObject, ZodRawShape } from 'zod';

export interface SendBase {
	kind: string;
}

export interface Channel<Send extends SendBase, Receive> {
	send: (options?: Omit<Send, 'kind'>) => Promise<Receive>;
	receive: (message: Send) => Promise<Receive | undefined>;
}

export interface SafeChannel<
	Send extends SendBase,
	Shape extends ZodRawShape,
	Receive extends ZodObject<Shape>,
> extends Channel<Send, ReturnType<Receive['safeParse']>> {
	send: (options?: Omit<Send, 'kind'>) => Promise<ReturnType<Receive['safeParse']>>;
	receive: (message: Send) => Promise<ReturnType<Receive['safeParse']> | undefined>;
}
