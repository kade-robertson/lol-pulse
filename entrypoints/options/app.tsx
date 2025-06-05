import { Button } from '@/ui/components/ui/button';
import { LoaderCircleIcon } from 'lucide-react';
import { useMemo } from 'react';
import AlarmsTable from './alarms';
import LiveGames from './live-games';
import Schedule from './schedule';
import { useApolloConfig } from './use-apollo-client';

enum State {
	NoAPIKey = 0,
	APIKeyLoading = 1,
	APIKeyLoaded = 2,
	APIKeyError = 3,
}

const App = () => {
	const { config, loading, fetchApolloConfig } = useApolloConfig();

	const state: State = useMemo(() => {
		if (config == null) {
			return State.NoAPIKey;
		}
		if (loading) {
			return State.APIKeyLoading;
		}
		return State.APIKeyLoaded;
	}, [config, loading]);

	return (
		<div>
			<div style={{ minHeight: '100vh', padding: '1em' }}>
				<div className="flex flex-col justify-center items-center gap-4">
					<div className="flex justify-center items-center gap-4 mb-2">
						<img alt="logo" width={64} src="/icon-128.png" />
						<h1 className="text-5xl font-semibold">LoL Pulse</h1>
					</div>
					{state === State.NoAPIKey && (
						<div className="flex flex-col gap-4 justify-center items-center mb-2 max-w-1/2">
							<p className="text-lg text-center">
								LoL Pulse requires additional information to load. This may take some time. You will
								automatically be returned to this tab when possible.
							</p>
							<Button size="lg" className="text-lg" onClick={fetchApolloConfig}>
								Load Additional Information
							</Button>
						</div>
					)}
				</div>
				{state === State.APIKeyLoading && (
					<div className="flex justify-center align-center">
						<LoaderCircleIcon size={64} className="animate-spin" />
					</div>
				)}
				{state === State.APIKeyLoaded && (
					<div className="flex justify-center align-center">
						<div className="flex flex-col gap-4">
							<LiveGames />
							<Schedule />
							<AlarmsTable />
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default App;
