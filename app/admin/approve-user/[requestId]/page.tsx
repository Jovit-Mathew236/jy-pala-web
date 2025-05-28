import ApproveUserPage from "@/components/admin/approve-user";

type Params = Promise<{ requestId: string }>;

export default async function CareerPosition(props: { params: Params }) {
  const params = await props.params;
  const requestId = params.requestId;

  return <ApproveUserPage requestId={requestId} />;
}
