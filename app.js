// BUDGET CONTROLLER 
var budgetController = (function(){
	
	// Constructor Function

	var Expense = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome){

		if(totalIncome > 0){
			this.percentage = Math.round((this.value / totalIncome) * 100);
		}
		else {
			this.percentage = -1;
		}
		

	};

	Expense.prototype.getPercentage = function (){
		return this.percentage;
	};

	var Income = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type){
		var sum = 0;
		data.allItems[type].forEach(function (curr){
			sum += curr.value;

		});
		data.totals[type] = sum;
	};

	// DATA STRUCTURE 

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp:0,
			inc:0
		},
		budget: 0,
		percentage: -1
	};

	return {
		addNewItem: function(type,des,val){
			var ID,newItem;
			
			// generate new ID
			// last element 
			//data.allItems[type][data.allItems[type].length - 1].id 
			
			if(data.allItems[type].length > 0){
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			}
			else {
				ID = 0;
			}

			//Create new item based on 'inc' or 'exp' type
			if(type === 'exp'){
				newItem = new Expense(ID,des,val);
			}
			else if(type === 'inc'){
				newItem = new Income(ID,des,val); 
			}
			
			// push new item to our data structure
			data.allItems[type].push(newItem);

			return newItem;
		},

		deleteItem: function(type, id){
			var ids,index;
			// id = 36
			// data.allItems[type][id]; -- not work properly 
			// ids = [1 2 4 6 8]
			// index = 3

			// map gives new array after mapping
			ids = data.allItems[type].map(function(current,index,array){
				return current.id;
			});

			index = ids.indexOf(id);

			if (index !== -1){
				// splice function where to delete the elements and how many elements delete from array 
				data.allItems[type].splice(index,1);
			}

		},

		calculateBudget: function(){

			// calculate total income and expenses
				calculateTotal('exp');
				calculateTotal('inc');

			// calculate the budget: income - expenses
				data.budget = data.totals.inc - data.totals.exp;
			// calculate the percentage of income that we spent 
				if(data.totals.inc > 0){
					data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
				}
				else{
					data.percentage = -1;
				}
				

		},

		calculatePercentages: function(){

			/*
			a=20
			b=10
			c=40
			income = 100
			a% = (20/100) * 100 = 20%
			*/
			data.allItems.exp.forEach(function(curr){
				curr.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function (){
			var allPerc = data.allItems.exp.map(function(curr){
				return curr.getPercentage();
			});
			return allPerc;
		},

		getBudget: function (){
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},

		testing: function(){
			console.log(data); 
		}
	};

})();


// UI Controller
var UIController = (function (){

	var DOMStrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputButton: '.add__btn',
		expensesContainer: '.expenses__list',
		incomeContainer: '.income__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	}

	var formatNumber = function (num,type){
		/* 
		+ or - before number 
		exactly 2 decimal points 
		comma separating the thousands 

		2310.4567 -> 2,310.46
		2000 -> 2,000.00
		1,00,000
		10,00,000
		1,00,00,000
		*/

		//abs give absolute value 
		num = Math.abs(num);
		// toFixed fixed decimal value
		num = num.toFixed(2);
		numSplit = num.split('.');
		
		int = numSplit[0];
		// here int is a string 
		if(int.length > 3 && int.length <= 5 ){
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, (int.length - 1));
		}
		// else if(int.length > 5 && int.length <= 7){
		// 	int = int.substr(0, (int.length - 5)) + ',' + int.substr((int.length - 5), (int.length - 3)) + ',' + int.substr(int.length - 3, (int.length - 1));

		// }
		//20,000 
		//01234
		dec = numSplit[1];

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

	}

	var nodeListForEach = function(list, callback){
		for( var i = 0; i < list.length; i++){
			callback(list[i],i);
		}
	
	};


	return {
		getInput: function () {
			
			return{
				type: document.querySelector(DOMStrings.inputType).value,
				description: document.querySelector(DOMStrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
			}; 
		},

		addListItem: function(obj, type){
			var html,newHtml,element;

			// Create HMTL String with the placeholder text
			if(type === 'inc'){
				element = DOMStrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-#id#"><div class="item__description">#description#</div><div class="right clearfix"><div class="item__value">#value#</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			
			}
			else if(type === 'exp'){
				element = DOMStrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-#id#"><div class="item__description">#description#</div><div class="right clearfix"><div class="item__value">#value#</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			// Replace the placeholder text with some actual data 
				newHtml = html.replace('#id#',obj.id);
				newHtml = newHtml.replace('#description#',obj.description);
				newHtml = newHtml.replace('#value#',formatNumber(obj.value,type));

			// Insert the HTML into the DOM 
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteListItem: function(selectorID){
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		getDOMStrings: function () {
			return DOMStrings;
		},

		clearFields: function() {
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
			fieldsArr = Array.prototype.slice.call(fields);
		
			//return fields;
			//return fieldsArr;

			fieldsArr.forEach(function (current, index, array){
				current.value = '';
			});

			// fieldsArr[0].focus();
			document.querySelector(DOMStrings.inputType).focus();
		},

		displayBudget: function(obj){
			var type,budget;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			obj.budget === 0 ? budget = '0.00' : budget = formatNumber(obj.budget,type);
			document.querySelector(DOMStrings.budgetLabel).textContent = budget;
			document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
			document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');
			if(obj.percentage > 0){
				document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
			}
			else{
				document.querySelector(DOMStrings.percentageLabel).textContent = '---';
			}
			
		},

		displayPercentages: function(percentages){
			var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
			
			nodeListForEach(fields, function(current, index){
				if(percentages[index] > 0){
					current.textContent = percentages[index] + ' %';
				}
				else{
					current.textContent = '---';
				}
			});
			
		},

		displayDate: function(){
			var now, months, month, year;
			months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

			now = new Date();
			// console.log(now);
			month = now.getMonth();
			year = now.getFullYear();
			// console.log(months[month]);
			// console.log(year);


			document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;

		},
		
		changeType: function(){

			var fields = document.querySelectorAll(
				DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue
			);

			nodeListForEach(fields,function(cur){
				cur.classList.toggle('red-focus');
			});

			document.querySelector(DOMStrings.inputButton).classList.toggle('red');

		}

		
	}; 

})();


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

	var setupEventListeners = function (){
		
		var DOM = UICtrl.getDOMStrings();
		document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
	
		// Handling enter key press
		document.addEventListener('keypress', function(e){
			if(e.keyCode === 13 || e.which === 13) {ctrlAddItem();}
			});
		
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);

		};
	
	var updateBudget = function (){
		// 1. Calculate the budget 
			budgetCtrl.calculateBudget();
		// 2. Return the calculate the budget
			var budget = budgetCtrl.getBudget();
		// 3. Display the budget on the UI
			UICtrl.displayBudget(budget);
	};

	var updatePercentages = function(){

		// 1. Calculate Percentages 
			budgetCtrl.calculatePercentages();
		// 2. Read percentages from the budget controller
			var percentage =  budgetCtrl.getPercentages();
		// 3. Update the UI with the new percentages 
			UICtrl.displayPercentages(percentage);

	};


	var ctrlAddItem = function () {
		var input,newItem;

		// 1. Get the field input data 
			input = UICtrl.getInput();

		if(input.description !== '' && input.type !== '' && !isNaN(input.value) && input.value > 0){
			
			// 2. Add the item to the budget controller 
			newItem = budgetCtrl.addNewItem(input.type,input.description,input.value);
			
			// 3. Add the item to the UI 
			UICtrl.addListItem(newItem, input.type);
		
			// 4. Clear the input fields 
			UICtrl.clearFields();

			// 5. calculate and update the budget 
			updateBudget();

			// 6. calculate and update the percentages 
			updatePercentages();

		}
	};
	
	var ctrlDeleteItem = function (event){
		var itemID,splitID,type,ID;
		
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if(itemID){

			//inc-1

			splitID = itemID.split('-')
			type = splitID[0];
			ID = parseInt(splitID[1]);

			// 1. delete the item from the data structure 
				budgetCtrl.deleteItem(type,ID);

			// 2. delete the item from UI
				UICtrl.deleteListItem(itemID);

			// 3. Update and show the new budget
				updateBudget();

			// 4. calculate and update percentages 
				updatePercentages();
		}

		//return console.log(splitID);
		

	}
	
	return {
			init: function () {
				console.log('!! Budget App is Started !!');
				UICtrl.displayDate();
				setupEventListeners();
				UICtrl.displayBudget({
					budget: 0,
					totalInc: 0,
					totalExp: 0,
					percentage: -1
				});
			}
	};


})(budgetController,UIController);

controller.init();