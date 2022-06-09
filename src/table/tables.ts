import { Table } from './table'

export class Tables {
	private static _tables: Array<Table> = []

	static getTables() {
		return Tables._tables
	}

	static setTables(tables: Array<Table>) {
		Tables._tables = tables
	}

	static addTable(table: Table) {
		Tables._tables.push(table)
	}

	static removeTable(tableName: string) {
		Tables._tables = Tables._tables.filter((val) => val.name !== tableName)
	}

	static findTable(tableName: string): Table {
		return Tables._tables.filter((val) => val.name === tableName)[0]
	}
}
