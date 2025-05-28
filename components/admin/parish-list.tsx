import Link from "next/link";

type Parish = {
  id: number;
  name: string;
  fullName: string;
  count: number;
};

type ParishListProps = {
  parishes: Parish[];
};

export function ParishList({ parishes }: ParishListProps) {
  const topParishes = parishes.slice(0, 3);
  const remainingParishes = parishes.slice(3);

  return (
    <div className="rounded-lg overflow-hidden">
      {/* Yellow section with first 3 parishes */}
      <div className="bg-[#fffb8f] p-4">
        {topParishes.map((parish) => (
          <Link
            href={`/admin/parish/${parish.id}`}
            key={parish.id}
            className="block mb-4 last:mb-0 hover:bg-[#fffb00]/30 p-2 rounded-md transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-lg">
                  {parish.id}. {parish.name}
                </h2>
                <p className="uppercase text-sm">{parish.fullName}</p>
              </div>
              <div className="text-2xl font-bold">{parish.count}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Green section with remaining parishes */}
      {remainingParishes.length > 0 && (
        <div className="bg-[#ccff90] p-4">
          {remainingParishes.map((parish) => (
            <Link
              href={`/admin/parish/${parish.id}`}
              key={parish.id}
              className="block mb-4 last:mb-0 hover:bg-[#b9ff59]/30 p-2 rounded-md transition-colors"
            >
              <div className="flex">
                <div>
                  <p className="text-base">
                    {parish.id}. {parish.name} {parish.fullName}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
