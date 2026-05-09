import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		alias: { $three: 'src/lib/three' },
		adapter: adapter()
	}
};

export default config;
