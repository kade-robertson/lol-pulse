import { EyeInvisibleOutlined } from '@ant-design/icons';
import Button from 'antd/es/button';
import { type ReactNode, useState } from 'react';

const HiddenItem = ({ children }: { children: ReactNode }) => {
	const [hidden, setHidden] = useState(true);

	return hidden ? (
		<Button icon={<EyeInvisibleOutlined />} size="small" onClick={() => setHidden(!hidden)} />
	) : (
		<>{children}</>
	);
};

export default HiddenItem;
