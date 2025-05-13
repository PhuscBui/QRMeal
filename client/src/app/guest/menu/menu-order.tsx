"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useDishListQuery } from "@/queries/useDish";
import { cn, formatCurrency, handleErrorApi } from "@/lib/utils";
import Quantity from "@/app/guest/menu/quantity";
import { useMemo, useState, useCallback } from "react";
import { GuestCreateOrdersBodyType } from "@/schemaValidations/guest.schema";
import { useGuestOrderMutation } from "@/queries/useGuest";
import { useRouter } from "next/navigation";
import { DishStatus } from "@/constants/type";
import { Input } from "@/components/ui/input";
import { Mic, MicOff } from "lucide-react";

export default function MenuOrder() {
  const { data } = useDishListQuery();
  const dishes = useMemo(() => data?.payload.result ?? [], [data]);
  const [orders, setOrders] = useState<GuestCreateOrdersBodyType>([]);
  const [searchText, setSearchText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const { mutateAsync } = useGuestOrderMutation();
  const router = useRouter();
  // React 19 hoặc Next.js 15 thì không cần dùng useMemo chỗ này
  const totalPrice = useMemo(() => {
    return dishes.reduce((result, dish) => {
      const order = orders.find((order) => order.dish_id === dish._id);
      if (!order) return result;
      return result + order.quantity * dish.price;
    }, 0);
  }, [dishes, orders]);

  const handleQuantityChange = (dish_id: string, quantity: number) => {
    setOrders((prevOrders) => {
      if (quantity === 0) {
        return prevOrders.filter((order) => order.dish_id !== dish_id);
      }
      const index = prevOrders.findIndex((order) => order.dish_id === dish_id);
      if (index === -1) {
        return [...prevOrders, { dish_id, quantity }];
      }
      const newOrders = [...prevOrders];
      newOrders[index] = { ...newOrders[index], quantity };
      return newOrders;
    });
  };

  const handleOrder = async () => {
    try {
      await mutateAsync(orders);
      router.push(`/guest/orders`);
    } catch (error) {
      handleErrorApi({
        error,
      });
    }
  };

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'vi-VN';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchText(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, []);

  const filteredDishes = useMemo(() => {
    if (!searchText.trim()) return dishes.filter(dish => dish.status !== DishStatus.Hidden);
    
    const searchTerms = searchText.toLowerCase().trim().split(/\s+/);
    return dishes.filter((dish) => {
      const dishName = dish.name.toLowerCase();
      const dishDesc = dish.description.toLowerCase();
      
      const matchesSearch = searchTerms.every(term => 
        dishName.includes(term) || dishDesc.includes(term)
      );
      
      return matchesSearch && dish.status !== DishStatus.Hidden;
    });
  }, [dishes, searchText]);

  return (
    <>
      <div className="mb-4 flex gap-2 items-center">
        <Input
          placeholder="Tìm kiếm món ăn..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="flex-1"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={startListening}
          className={isListening ? "bg-red-100" : ""}
          title="Tìm kiếm bằng giọng nói"
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      </div>
      {filteredDishes.map((dish) => (
        <div
          key={dish._id}
          className={cn("flex gap-4", {
            "pointer-events-none": dish.status === DishStatus.Unavailable,
          })}
        >
          <div className="flex-shrink-0 relative">
            {dish.status === DishStatus.Unavailable && (
              <span className="absolute inset-0 flex items-center justify-center text-sm">
                Hết hàng
              </span>
            )}
            <Image
              src={dish.image || "https://placehold.co/600x400"}
              alt={dish.name}
              height={100}
              width={100}
              quality={100}
              className="object-cover w-[80px] h-[80px] rounded-md"
            />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm">{dish.name}</h3>
            <p className="text-xs">{dish.description}</p>
            <p className="text-xs font-semibold">
              {formatCurrency(dish.price)}
            </p>
          </div>
          <div className="flex-shrink-0 ml-auto flex justify-center items-center">
            <Quantity
              onChange={(value) => handleQuantityChange(dish._id, value)}
              value={
                orders.find((order) => order.dish_id === dish._id)
                  ?.quantity ?? 0
              }
            />
          </div>
        </div>
      ))}
      <div className="sticky bottom-0">
        <Button
          className="w-full justify-between"
          onClick={handleOrder}
          disabled={orders.length === 0}
        >
          <span>Đặt hàng · {orders.length} món</span>
          <span>{formatCurrency(totalPrice)}</span>
        </Button>
      </div>
    </>
  );
}
