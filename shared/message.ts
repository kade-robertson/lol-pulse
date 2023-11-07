export interface SendBase {
	kind: string;
}

export interface Channel<Send extends SendBase, Receive> {
	send: (options?: Omit<Send, 'kind'>) => Promise<Receive>;
	receive: (message: Send) => Promise<Receive | undefined>;
}
