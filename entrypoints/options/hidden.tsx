import { EyeOff } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Button } from '@/ui/components/ui/button';

const HiddenItem = ({ children }: { children: ReactNode }) => {
	const [hidden, setHidden] = useState(true);

	return hidden ? (
		<Button size="xs" variant="outline" onClick={() => setHidden(!hidden)}>
			<EyeOff />
		</Button>
	) : (
		children
	);
};

export default HiddenItem;
