const { registerBlockType } = wp.blocks;
const { useBlockProps } = wp.blockEditor;

registerBlockType('bookitfast/properties', {
	title: 'Properties List',
	description: 'Displays a list of properties fetched from the Laravel API.',
	icon: 'building',
	category: 'widgets',
	edit: () => {
		const blockProps = useBlockProps();
		return <div {...blockProps}>Properties List will render dynamically on the frontend.</div>;
	},
	save: () => {
		return null; // Dynamic block (rendered via PHP)
	},
});
