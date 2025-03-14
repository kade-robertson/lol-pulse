import type * as v from "valibot";

export interface SendBase {
	kind: string;
}

export interface Channel<Send extends SendBase, Receive> {
	send: (options?: Omit<Send, "kind">) => Promise<Receive>;
	receive: (message: Send) => Promise<Receive | undefined>;
}

export interface SafeChannel<
	Send extends SendBase,
	Shape extends v.ObjectEntries,
	Receive extends v.ObjectSchema<Shape, undefined>
> extends Channel<Send, ReturnType<typeof v.safeParse<Receive>>> {
	send: (
		options?: Omit<Send, "kind">
	) => Promise<ReturnType<typeof v.safeParse<Receive>>>;
	receive: (
		message: Send
	) => Promise<ReturnType<typeof v.safeParse<Receive>> | undefined>;
}
