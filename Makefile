include .env

.PHONY: test

delete:
	@printf "➜  %s  %s [\033[35m%s\033[0m]" "🗑️" "delete" ${name}
	@aws lambda delete-function --function-name bytelyon-node-${name} | jq
	@printf "  ✅\n"

test:
	@printf "➜  %s  %s [\033[35m%s\033[0m]\n\n" "📊" "test" "*"
	@npx jest
	@printf "  ✅\n"

logs:
	@printf "➜  %s  %s [\033[35m%s\033[0m]" "👀" "logs" ${name}
	@open "https://us-east-1.console.aws.amazon.com/cloudwatch/home#logStream:group=/aws/lambda/bytelyon-node-${name}"
	@printf "  ✅\n"

build:
	@printf "➜  %s  %s [\033[35m%s\033[0m]" "🛠" "build" ${name}
	@rm -rf dist
	@printf "  ✅\n"
	@npx tsx build.ts ${name}
	@cd dist && zip -r index.zip index.js*

create: build
	@printf "➜  %s  %s [\033[35m%s\033[0m]" "💽" "create" ${name}
	@aws lambda create-function \
		--function-name bytelyon-node-${name} \
		--runtime "nodejs22.x" \
		--role ${ROLE} \
		--zip-file "fileb://dist/index.zip" \
		--handler index.handler \
		--environment "Variables={$(shell tr '\n' ',' < ./src/handler/${name}/.env)}" > /dev/null
	@printf "  ✅\n"

update:
	@printf "➜  %s  %s [\033[35m%s\033[0m]" "💾" "update" ${name}
	@aws lambda update-function-configuration \
		--function-name bytelyon-node-${name} \
		--role ${ROLE} \
		--timeout "300" \
		--memory-size "2048" \
		--handler index.handler \
		--environment "Variables={$(shell tr '\n' ',' < ./src/handler/${name}/.env)}" > /dev/null
	@aws lambda update-function-code \
		--zip-file "fileb://dist/index.zip" \
		--function-name bytelyon-node-${name} > /dev/null
	@printf "  ✅\n"
