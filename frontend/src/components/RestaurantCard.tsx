import Image from "next/image";
import { useRouter } from "next/navigation";
import { memo } from "react";

const RestaurantCard = ({restaurantID, imageURL, name, cuisine, rating, ratePerPerson}: {
    restaurantID: string,
    imageURL: string,
    name: string,
    cuisine: string, 
    rating: number, 
    ratePerPerson: number
}) => {
    const router = useRouter();
    
    const handleClick = () => {
        router.push(`/view-restaurant/${restaurantID}`);
    };
    const imageList =[
        "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500"
    ];
    
    // Use a random image from imageList if imageURL is empty
    const displayImageURL : string  =  imageURL?.length === 0 ? imageList[Math.floor(Math.random() * imageList.length)]:imageURL;
    
    return (
        <div 
            onClick={handleClick}
            className="w-full max-w-sm bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-shadow duration-300 ease-in-out cursor-pointer border border-[#f5f5f5] flex flex-col justify-between"
        >
            <div className="">
                <div className="relative w-full h-48 mb-2">
                    <Image src={displayImageURL} alt="Restaurant" fill className="object-cover rounded-t-2xl " />
                </div>
                <h2 className="px-4 text-2xl font-bold text-[#232629] mb-1">{name}</h2>
                <div className="flex items-center justify-between px-4 pb-2">
                    <span className="text-base text-[#232629] font-medium">{cuisine} • ${ratePerPerson}</span>
                    <span className="text-base font-bold text-[#fc8019]">{rating} ★</span>
                </div>
            </div>
            <button
                className="w-full bg-[#fc8019] hover:bg-[#ff922b] text-white font-bold py-3 rounded-b-2xl text-lg mt-2 transition-colors"
                style={{ letterSpacing: 1 }}
            >
                Book Now
            </button>
        </div>  
    )
}

export default memo(RestaurantCard);