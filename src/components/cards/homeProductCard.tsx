import { HomeCardDto } from '../../dto/product/homeCardDto'
import { Card } from 'antd'
const { Meta } = Card

const HomeProductCard = ({ product }: { product: HomeCardDto }) => {
    return (
        <Card
            hoverable
            cover={<img alt="example" src={product.images[0]} className="w-full h-60" />}

        >
            <Meta title={product.title}
                description={product.price}

            />
        </Card>
    )
}

export default HomeProductCard