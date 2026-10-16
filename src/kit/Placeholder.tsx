import { Header, Screen, Text } from '../components';
import { useNav } from './Navigator';

/** Temporary screen used while a flow is being built. */
export function Placeholder() {
  const nav = useNav();
  return (
    <Screen header={<Header title={nav.route} />}>
      <div style={{ padding: 24 }}>
        <Text>Coming soon: {nav.route}</Text>
      </div>
    </Screen>
  );
}
