import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function NyaxTokenDetailsAlias({ params }: { params: { logoId: string } }) {
  redirect(`/dashboard/nyax-token-details/${params.logoId}`)
}
