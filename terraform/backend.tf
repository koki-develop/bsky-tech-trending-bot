terraform {
  backend "s3" {
    bucket  = "bsky-tech-trending-bot-tfstates"
    key     = "terraform.tfstate"
    encrypt = true
  }
}
