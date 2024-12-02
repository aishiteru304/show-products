import { Input, Spin } from "antd"
import { useEffect, useState, useRef } from "react"
import { getProducts } from "./api/app"
import { isScrolledIntoView } from "./utils/checkIntoView"
import SkeletonCard from "./components/cards/skeletonCard"
import HomeProductCard from "./components/cards/homeProductCard"
import { HomeCardDto } from "./dto/product/homeCardDto"

function App() {

  const [products, setProducts] = useState<HomeCardDto[]>([])
  const params = useRef({
    limit: 10,
    skip: 0,
    search: ""
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [timeoutId, setTimeoutId] = useState<number>(0);

  // Ref lưu phần tử cuối cùng của products
  const endOfCardRef = useRef<HTMLLIElement>(null)

  // Kiểm tra đã loadmore hay chưa
  const isLoadMoreRef = useRef<boolean>(false)

  // State lưu trạng thái đang loadmore
  const [isLoadingLoadMore, setIsLoadingLoadMore] = useState<boolean>(false)

  useEffect(() => {
    // Hàm lấy dữ liệu
    getProducts(params.current.limit, params.current.skip, params.current.search)
      .then(res => {
        setProducts(res.data.products)
        console.log(res.data.products)
      })
      .catch(err => console.log(err))
      .finally(() => setIsLoading(false))


    // Lắng nghe card cuối cùng cuộn vào view
    window.addEventListener('scroll', handleEndCardToView);
    return () => window.removeEventListener('scroll', handleEndCardToView);
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Loại bỏ dấu và cắt chuỗi trống 
    const normalText = e.target.value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Nếu có sự khác nhau mới tìm kiếm
    if (normalText != params.current.search) {

      // Tạo debounce để hạn chế call api liên tục khi người dùng search
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const newTimeoutId = setTimeout(() => {

        // Cuộn lên đầu trang mượt mà 
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });

        getProducts(params.current.limit, 0, normalText)
          .then(res => {
            setProducts(res.data.products)

            // Cập nhật params
            params.current.search = normalText
            params.current.skip = 0

            // Kiểm tra hiệu ứng loadmore
            if (res.data.total > params.current.limit)
              isLoadMoreRef.current = false
            else isLoadMoreRef.current = true


          })
          .catch(err => console.log(err))

      }, 500)

      // Lưu id của timeout mới vào state
      setTimeoutId(newTimeoutId);

    }
  }

  const handleEndCardToView = () => {
    // Nếu tồn tại phần tử cuối cùng và được cuộn vào khung hình và chưa loadmore
    if (endOfCardRef.current && isScrolledIntoView(endOfCardRef.current) && !isLoadMoreRef.current) {
      // Chỉ loadmore lần đầu tiên vào view
      isLoadMoreRef.current = true

      handleLoadMore()

    }
  };

  const handleLoadMore = () => {
    setIsLoadingLoadMore(true)
    const newSkip = params.current.skip + params.current.limit
    getProducts(params.current.limit, newSkip, params.current.search)
      .then(res => {
        setProducts(prev => [...prev, ...res.data.products])
        // Cập nhật lại isLoadmore
        isLoadMoreRef.current = false

        // Cập nhật params
        params.current.skip = newSkip

        // Nếu sản phẩm đã hết thì bỏ loadmore
        if (newSkip + res.data.products.length == res.data.total)
          isLoadMoreRef.current = true

      })
      .catch(err => {
        console.log(err)
      })
      .finally(() => setIsLoadingLoadMore(false))

  }


  return (
    <main className="sm:max-w-7xl mx-auto sm:w-full max-w-96  px-2 py-40">
      <section>
        <div className="fixed sm:max-w-xl sm:w-full w-[300px] max-w-96 top-20 z-10">
          <Input
            placeholder="Search by name..."
            onChange={handleSearch}
          />
        </div>
      </section>


      {/* Nếu đang loading */}
      <section>
        {
          isLoading &&
          <div className="grid lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2">
            <SkeletonCard />
          </div>
        }
      </section>

      {/* Loading xong và có sản phẩm */}
      {
        !isLoading &&
        <div className="grid lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 gap-5">
          {
            products.map((product: any, index) => {
              if (products.length == index + 1)
                return (
                  <li className=" list-none" key={index} ref={endOfCardRef}>
                    <HomeProductCard product={product} />
                  </li>
                )
              else
                return (
                  <li className=" list-none" key={index}>
                    <HomeProductCard product={product} />
                  </li>
                )

            })
          }
          {isLoadingLoadMore && <div className='flex justify-center mt-40'><Spin /></div>}

        </div>
      }

      {/* Nếu loading xong và không có sản phẩm */}
      {
        !isLoading && products.length == 0 &&
        <section>
          <h2>Không có sản phẩm</h2>
        </section>
      }

    </main>
  )
}

export default App
