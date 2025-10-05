import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GetLeaguesChannel } from '@/shared/channels/get-leagues';
import type { League } from '@/shared/channels/shared-types';
import { Button } from '@/ui/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/ui/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/components/ui/popover';
import { cn } from '@/ui/lib/utils';
import { useFetch } from './use-fetch';

export interface LeagueSelectorProps {
	onLeagueSelected?: (league: League) => void;
}

export const LeagueSelector = (props: LeagueSelectorProps) => {
	const [open, setOpen] = useState(false);
	const { data, fetch } = useFetch(GetLeaguesChannel);
	const [selectedLeague, _setSelectedLeague] = useState<League | undefined>(undefined);

	const leagues = useMemo(() => data?.data.leagues ?? [], [data]);

	const setSelectedLeague = useCallback(
		(league: League | undefined) => {
			if (league != null) {
				props.onLeagueSelected?.(league);
			}
			_setSelectedLeague(league);
		},
		[props.onLeagueSelected],
	);

	useEffect(() => {
		fetch();
	}, [fetch]);

	useEffect(() => {
		if (selectedLeague == null) {
			setSelectedLeague(leagues.at(0));
		}
	}, [setSelectedLeague, selectedLeague, leagues]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					// biome-ignore lint/a11y/useSemanticElements: no
					role="combobox"
					aria-expanded={open}
					className="w-[200px] justify-between"
				>
					{selectedLeague ? selectedLeague.name : 'Choose a league...'}
					<ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command
					filter={(value, search) =>
						value.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ? 1 : 0
					}
				>
					<CommandInput placeholder="Choose a league..." />
					<CommandList>
						<CommandEmpty>No leagues found.</CommandEmpty>
						<CommandGroup>
							{leagues.map((league) => (
								<CommandItem
									key={league.id}
									value={league.name}
									onSelect={(currentValue) => {
										setSelectedLeague(leagues.find((l) => l.name === currentValue));
										setOpen(false);
									}}
								>
									<CheckIcon
										className={cn(
											'mr-2 h-4 w-4',
											league === selectedLeague ? 'opacity-100' : 'opacity-0',
										)}
									/>
									{league.name}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};
