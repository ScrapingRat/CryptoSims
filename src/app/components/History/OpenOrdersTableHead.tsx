const OpenOrdersTableHead = () => {
	return (
		<thead className="uppercase text-xs bg-accent2 sticky top-0">
			<tr className="">
				<th scope="col" className="pl-2 pr-2 py-1">
					Date
				</th>
				<th scope="col" className="pl-2 pr-2 py-1">
					Amount
				</th>
				<th scope="col" className="pl-2 pr-2 py-1">
					Target
				</th>
				<th scope="col" className="pl-2 pr-2 py-1">
					Type
				</th>
				<th
					scope="col"
					className="pl-2 pr-2 py-1"
					aria-label="Cancel"></th>
			</tr>
		</thead>
	);
};

export default OpenOrdersTableHead;
