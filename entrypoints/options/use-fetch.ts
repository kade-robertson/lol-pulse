import { useCallback, useState } from 'react';
import type * as v from 'valibot';
import type { SafeChannel, SendBase } from '@/shared/message';

export const useFetch = <
	S extends SendBase,
	T extends v.ObjectEntries,
	R extends v.ObjectSchema<T, undefined>,
>(
	channel: SafeChannel<S, T, R>,
) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);
	const [data, setData] = useState<v.InferOutput<R> | null>(null);

	const fetch = useCallback(
		async (options?: Omit<S, 'kind'>) => {
			setLoading(true);
			try {
				const res = await channel.send(options);
				if (res.success) {
					setData(res.output);
					setError(null);
				} else {
					setError(res.issues);
					setData(null);
				}
			} catch (e) {
				setError(e);
				setData(null);
			} finally {
				setLoading(false);
			}
		},
		[channel],
	);

	return { loading, error, data, fetch };
};
