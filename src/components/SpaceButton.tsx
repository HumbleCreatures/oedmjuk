import Link from 'next/link';
import { api } from "../utils/api";

export function SpaceLinkWithData ({spaceId}: {spaceId: string}) {
  const spaceResult = api.space.getSpace.useQuery({spaceId});
  if (spaceResult.isLoading) return <>loading...</>;
  if (!spaceResult.data)
    return <>Could not find space</>;
  const { space } = spaceResult.data;

  return <Link href={`/app/space/${space.id}`}>
    {space.name}
  </Link>
}
