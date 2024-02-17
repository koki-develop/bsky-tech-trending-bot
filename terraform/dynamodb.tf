resource "aws_dynamodb_table" "items" {
  name         = "${local.prefix}-items"
  billing_mode = "PAY_PER_REQUEST"

  hash_key = "url"

  attribute {
    name = "url"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }
}
