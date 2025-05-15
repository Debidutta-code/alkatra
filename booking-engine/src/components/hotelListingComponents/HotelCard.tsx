
const HotelCard = () =>{
    return(
        <>
        <div className="items-stretch flex justify-between gap-5 mt-6 max-md:max-w-full max-md:flex-wrap">
                <div className="justify-center items-center border border-[color:var(--gray-200,#E5E7EB)] flex grow basis-[0%] flex-col rounded-xl border-solid">
                  <img
                    loading="lazy"
                    srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/1cc16ebef4f5a78a2eb6fe22375354fd337e0e57b3055ddab1397f1c5f51e8a4?apiKey=06bef42c624743a9888f5d8e0d15a6ad&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/1cc16ebef4f5a78a2eb6fe22375354fd337e0e57b3055ddab1397f1c5f51e8a4?apiKey=06bef42c624743a9888f5d8e0d15a6ad&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/1cc16ebef4f5a78a2eb6fe22375354fd337e0e57b3055ddab1397f1c5f51e8a4?apiKey=06bef42c624743a9888f5d8e0d15a6ad&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/1cc16ebef4f5a78a2eb6fe22375354fd337e0e57b3055ddab1397f1c5f51e8a4?apiKey=06bef42c624743a9888f5d8e0d15a6ad&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/1cc16ebef4f5a78a2eb6fe22375354fd337e0e57b3055ddab1397f1c5f51e8a4?apiKey=06bef42c624743a9888f5d8e0d15a6ad&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/1cc16ebef4f5a78a2eb6fe22375354fd337e0e57b3055ddab1397f1c5f51e8a4?apiKey=06bef42c624743a9888f5d8e0d15a6ad&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/1cc16ebef4f5a78a2eb6fe22375354fd337e0e57b3055ddab1397f1c5f51e8a4?apiKey=06bef42c624743a9888f5d8e0d15a6ad&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/1cc16ebef4f5a78a2eb6fe22375354fd337e0e57b3055ddab1397f1c5f51e8a4?apiKey=06bef42c624743a9888f5d8e0d15a6ad&"
                    className="aspect-[6.82] object-contain object-center w-[300px] overflow-hidden"
                  />
                </div>
                <div className="items-stretch flex grow basis-[0%] flex-col justify-center max-md:max-w-full">
                  <div className="items-stretch flex justify-between gap-5 max-md:max-w-full max-md:flex-wrap">
                    <div className="items-stretch flex grow basis-[0%] flex-col">
                      <div className="text-gray-500 text-sm leading-5 whitespace-nowrap">
                        Entire home in Bordeaux
                      </div>
                      <div className="text-gray-700 text-xl font-medium leading-8 whitespace-nowrap">
                        Historic City Center Home
                      </div>
                    </div>
                    <img
                      loading="lazy"
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/56ddb93704015bc5aa2d1980117cb1ea3de2b2472d0b803982b0b3bfe5ce19c4?apiKey=06bef42c624743a9888f5d8e0d15a6ad&"
                      className="aspect-square object-contain object-center w-8 overflow-hidden shrink-0 max-w-full self-start"
                    />
                  </div>
                </div>
              </div></>
    )
}

export default HotelCard;