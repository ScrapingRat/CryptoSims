import Image from "next/image";

export default function Home() {
  return (
	<div className="pt-16 min-h-screen bg-background">
		<div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
			<div className="py-8">
				<div className="flex flex-col items-center justify-between gap-4">
					<h1 className="text-3xl font-bold content-center text-center">
						Explore cryptocurrency markets, invest in real-time with a virtual wallet
					</h1>
					<div className="text-lg text-gray-400 md:max-w-md text-center">
						Start trading with virtual currency and learn the basics of cryptocurrency markets in a risk-free environment.
					</div>
				</div>
			</div>
		</div>
	</div>
  )
}