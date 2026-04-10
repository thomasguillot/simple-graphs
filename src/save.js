import { useBlockProps } from '@wordpress/block-editor';
import Chart from './charts/Chart';
import { resolveTrackColor, resolveBlockGap, resolveMinHeight } from './track-color';
import { extractTypographyStyle, extractTypographyClasses } from './typography';

export default function save( { attributes } ) {
	const { items, legendPosition, valueMode, valueMax, valuePrefix, valueSuffix } = attributes;
	const blockProps = useBlockProps.save();
	const trackColor = resolveTrackColor( attributes );
	const blockGap = resolveBlockGap( attributes );
	const chartHeight = resolveMinHeight( attributes );

	const { typography: typographyStyle, rest: wrapperStyle } = extractTypographyStyle( blockProps.style || {} );
	const { typographyClassName, restClassName } = extractTypographyClasses( blockProps.className || '' );

	return (
		<div
			{ ...blockProps }
			className={ restClassName }
			style={ wrapperStyle }
		>
			<Chart
				items={ items }
				className={ restClassName }
				trackColor={ trackColor }
				legendPosition={ legendPosition }
				blockGap={ blockGap }
				chartHeight={ chartHeight }
				valueMode={ valueMode }
				valueMax={ valueMax }
				valuePrefix={ valuePrefix }
				valueSuffix={ valueSuffix }
				typographyStyle={ typographyStyle }
				typographyClassName={ typographyClassName }
			/>
		</div>
	);
}
