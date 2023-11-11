import { SafeChannel, SendBase } from '@/shared/message';
import { useCallback, useState } from 'react';
import { ZodObject, ZodRawShape, z } from 'zod';

export const useFetch = <S extends SendBase, T extends ZodRawShape, R extends ZodObject<T>>(
	channel: SafeChannel<S, T, R>,
) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);
	const [data, setData] = useState<z.infer<R> | null>(null);

	const fetch = useCallback(
		async (options?: Omit<S, 'kind'>) => {
			setLoading(true);
			try {
				const res = await channel.send(options);
				if (res.success) {
					setData(res.data);
					setError(null);
				} else {
					setError(res.error);
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
