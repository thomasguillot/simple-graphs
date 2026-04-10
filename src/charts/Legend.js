export default function Legend( { items } ) {
	return (
		<div className="simple-graphs-legend">
			{ items.map( ( item ) => {
				return (
					<div
						key={ item.id }
						className="simple-graphs-legend__item"
					>
						<span
							className="simple-graphs-legend__swatch"
							style={ { background: item.color } }
						/>
						<span className="simple-graphs-legend__label">
							{ item.title }
						</span>
					</div>
				);
			} ) }
		</div>
	);
}
